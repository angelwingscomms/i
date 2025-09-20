import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/util/realtime', () => {
  return {
    realtime: {
      post: vi.fn().mockResolvedValue({ statusText: 'Created', data: { data: { id: 'mtg123' } } })
    }
  };
});

const createMock = vi.fn().mockResolvedValue('msgid');
const getMock = vi.fn();
const setMock = vi.fn().mockResolvedValue(undefined);

vi.mock('$lib/db', async () => {
  return {
    create: (...args: any[]) => createMock(...args),
    get: (...args: any[]) => getMock(...args),
    set: (...args: any[]) => setMock(...args)
  };
});

const sendPushMock = vi.fn().mockResolvedValue({});
vi.mock('$lib/util/send_push_notif', () => ({
  send_push_notif: (...args: any[]) => sendPushMock(...args)
}));

vi.mock('$lib/util/chat/process_message', () => ({
  process_message: async (base: any) => ({ ...base, tc: 10 })
}));

// Import after mocks
import { POST } from '../src/routes/r/[i]/+server';

function makeRequest(body: any) {
  return new Request('http://localhost/r/room1', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}

describe('push notifications on private room message', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds rich payload and prunes expired subs before sending', async () => {
    const now = Date.now();

    // Room lookup
    getMock.mockImplementation(async (id: string, payload?: string) => {
      if (id === 'room1') {
        return { _: '|', x: ['u1', 'u2'] } as any; // private room with two members
      }
      if (payload === 'ps' && id === 'u2') {
        return [
          { endpoint: 'https://push/valid', keys: { p256dh: 'x', auth: 'y' } },
          { endpoint: 'https://push/expired', keys: { p256dh: 'x2', auth: 'y2' }, expirationTime: now - 1000 }
        ];
      }
      if (payload === 'ps' && id === 'u1') {
        return [ { endpoint: 'https://push/sender', keys: { p256dh: 'a', auth: 'b' } } ];
      }
      return null;
    });

    const event: any = {
      platform: {},
      request: makeRequest({ m: 'hello', t: 'alice', _: '|', i: 'mid' }),
      params: { i: 'room1' },
      locals: { user: { i: 'u1', t: 'alice' } }
    };

    const res = await POST(event);
    expect(res).toBeInstanceOf(Response);

    // Should have pruned u2 expired sub
    expect(setMock).toHaveBeenCalledWith('u2', {
      ps: [ { endpoint: 'https://push/valid', keys: { p256dh: 'x', auth: 'y' } } ]
    });

    // Should send exactly 1 push (only valid u2)
    expect(sendPushMock).toHaveBeenCalledTimes(1);
    const args = sendPushMock.mock.calls[0];
    const payload = args[1];
    expect(payload.title).toBe('Message from alice');
    expect(payload.body).toBe('hello');
    expect(payload.data.url).toBe('/r/room1?message=mid');
    expect(payload.tag).toBe('room-room1');
  });
});

