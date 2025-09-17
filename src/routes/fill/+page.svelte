<!-- <script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import * as ort from 'onnxruntime-web';
  import { handle_image_scale } from '$lib/sam/scale';
  import { onnx_mask_to_image } from '$lib/sam/mask';
  import { model_data } from '$lib/sam/model';
  import { clicks, image, mask_img, model, tensor, model_scale } from '$lib/stores/sam';
  import { debounce } from '$lib/util/debounce';
  import type { ModelInputProps, ModelScaleProps } from '$lib/types/sam';

  let should_fit_to_width = $state(true);
  let mouse_handler: ((e: MouseEvent | TouchEvent) => void) | null = null;

  const IMAGE_PATH = '/sam/data/dogs.jpg';
  const IMAGE_EMBEDDING = '/sam/data/dogs_embedding.npy';
  const MODEL_DIR = '/model/sam_onnx_quantized_example.onnx';

  onMount(async () => {
    if (!browser) return;

    // Init model
    try {
      const session = await ort.InferenceSession.create(MODEL_DIR);
      model.set(session);
    } catch (e) {
      console.error(e);
    }

    // Load image
    const img = new Image();
    img.src = IMAGE_PATH;
    img.onload = () => {
      const { height, width, sam_scale } = handle_image_scale(img);
      model_scale.set({ height, width, sam_scale });
      img.width = width;
      img.height = height;
      image.set(img);
    };

    // Load embedding
    try {
      const np_loader = new npyjs();
      const np_array = await np_loader.load(IMAGE_EMBEDDING);
      const embedding_tensor = new ort.Tensor('float32', np_array.data, np_array.shape);
      tensor.set(embedding_tensor);
    } catch (e) {
      console.error(e);
    }

    // Setup resize observer for fit to width
    fit_to_page();
    const resize_observer = new ResizeObserver(fit_to_page);
    resize_observer.observe(document.body);
    return () => resize_observer.disconnect();

    // Setup mouse handler
    mouse_handler = debounce(handle_mouse_move, 15);
  });

  function fit_to_page() {
    $image?.width && ($should_fit_to_width = $image.width / $image.height > window.innerWidth / window.innerHeight);
  }

  function get_click(x: number, y: number): ModelInputProps {
    return { x, y, click_type: 1 };
  }

  function handle_mouse_move(e: MouseEvent | TouchEvent) {
    if (!$image || !e.currentTarget) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    let y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    const image_scale = $image.width / rect.width;
    x *= image_scale;
    y *= image_scale;
    clicks.set([get_click(x, y)]);
  }

  // Reactive run ONNX on clicks change
  $effect(() => {
    if ($clicks && $model && $tensor && $model_scale) {
      run_onnx();
    }
  });

  async function run_onnx() {
    try {
      const feeds = model_data({ clicks: $clicks, tensor: $tensor, model_scale: $model_scale });
      if (!feeds) return;
      const results = await $model.run(feeds);
      const output = results[$model.outputNames[0]];
      const mask_image = onnx_mask_to_image(output.data as Float32Array, output.dims[2], output.dims[3]);
      mask_img.set(mask_image);
    } catch (e) {
      console.error(e);
    }
  }

  // Clear mask on mouse out
  function handle_mouse_out() {
    mask_img.set(null);
  }
</script>

<svelte:window on:resize={fit_to_page} />

<div class="flex items-center justify-center w-full h-screen">
  <div class="flex items-center justify-center relative w-[90%] h-[90%]">
    {#if $image}
      <img
        src={$image.src}
        alt="dogs"
        class="object-contain {should_fit_to_width ? 'w-full' : 'h-full'}"
        on:mousemove={mouse_handler}
        on:touchmove={mouse_handler}
        on:mouseout={handle_mouse_out}
        on:touchend={handle_mouse_out}
      />
    {/if}
    {#if $mask_img}
      <img
        src={$mask_img.src}
        alt="mask"
        class="absolute inset-0 w-full h-full opacity-40 pointer-events-none object-contain {should_fit_to_width ? 'w-full' : 'h-full'}"
      />
    {/if}
  </div>
</div> -->
