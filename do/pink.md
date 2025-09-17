match design system for a all pages
let the pages be beautiful, have great UI/UX, the elements fit well w/ each other and have good spacing and proportions to each other, follow best practice UI/UX design principles and techniques

#pages

/pink
allows user to generate images
allows user to upload multiple images
allows user to search presets using SearchPresets modal
`match preset images` toggle, default true
if using preset, and `match preset images` is true, make sure the user uploads exactly the number of images to match preset.i.length

example:

```TypeScript
import {
  GoogleGenAI,
} from '@google/genai';
import mime from 'mime';
import { writeFile } from 'fs';

function saveBinaryFile(fileName: string, content: Buffer) {
  writeFile(fileName, content, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing file ${fileName}:`, err);
      return;
    }
    console.log(`File ${fileName} saved to file system.`);
  });
}

async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    responseModalities: [
        'IMAGE',
        'TEXT',
    ],
  };
  const model = 'gemini-2.5-flash-image-preview';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          inlineData: {
            data: `<b64 data>`
          },
        },
        {
          text: `this is the prompt`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let fileIndex = 0;
  for await (const chunk of response) {
    if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
      continue;
    }
    if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const fileName = `ENTER_FILE_NAME_${fileIndex++}`;
      const inlineData = chunk.candidates[0].content.parts[0].inlineData;
      const fileExtension = mime.getExtension(inlineData.mimeType || '');
      const buffer = Buffer.from(inlineData.data || '', 'base64');
      saveBinaryFile(`${fileName}.${fileExtension}`, buffer);
    }
    else {
      console.log(chunk.text);
    }
  }
}

main();
```

new db type 'preset', tenant-id: 'p'
Preset {
n: //name,
p: //prompt
a: //about
d: //date number
i: //string[]
}

SearchPresets components
allows user to search presets
has create button
(just like /r)

/pink/presets
just renders SearchPresets

/pink/preset/:i
detail page for a preset
