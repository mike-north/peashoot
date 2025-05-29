import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

// Configuration:
// TARGET_ICON_DIMENSION: The icon's main content will be resized to fit within these dimensions (e.g., 100 means 100x100).
const TARGET_ICON_DIMENSION = 100;
// FINAL_CANVAS_DIMENSION: The final dimension of the output PNG file (e.g., 128 means 128x128).
// This will include the icon content + padding.
const FINAL_CANVAS_DIMENSION = 128;

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.error("Usage: ts-node scripts/slice-thumbnails.ts <input_folder> <output_folder>");
        process.exit(1);
    }

    const inputFolder = path.resolve(args[0]);
    const outputFolder = path.resolve(args[1]);

    try {
        await fs.mkdir(outputFolder, { recursive: true });
        console.log(`Input folder: ${inputFolder}`);
        console.log(`Output folder ensured at: ${outputFolder}`);

        const files = await fs.readdir(inputFolder);
        const pngFiles = files.filter(file => file.toLowerCase().endsWith('.png'));

        if (pngFiles.length === 0) {
            console.log(`No PNG files found in ${inputFolder}`);
            return;
        }

        console.log(`Found ${pngFiles.length} PNG file(s) to process.`);

        for (const pngFile of pngFiles) {
            const inputFile = path.join(inputFolder, pngFile);
            const inputFileBaseName = path.basename(pngFile, '.png');
            console.log(`\nProcessing ${inputFile}...`);

            const tempTileDir = path.join(outputFolder, `${inputFileBaseName}_tiles_temp`);
            await fs.mkdir(tempTileDir, { recursive: true });

            try {
                // 1. Slice the image into a 3x3 grid.
                // ImageMagick's %d formatter creates filenames like _tile_0.png, _tile_1.png, ...
                const cropCommand = `magick convert "${inputFile}" -crop 3x3@ +repage +adjoin "${path.join(tempTileDir, `${inputFileBaseName}_tile_%d.png`)}"`;
                console.log(`Executing: ${cropCommand}`);
                await execAsync(cropCommand);
                console.log(`Successfully sliced ${pngFile}. Processing individual tiles...`);

                for (let i = 0; i < 9; i++) {
                    const rawTileFileName = `${inputFileBaseName}_tile_${i}.png`;
                    const tempRawTilePath = path.join(tempTileDir, rawTileFileName);

                    const trimmedTileFileName = `${inputFileBaseName}_trimmed_tile_${i}.png`;
                    const tempTrimmedTilePath = path.join(tempTileDir, trimmedTileFileName);
                    
                    const finalOutputName = `${inputFileBaseName}_${i}.png`;
                    const finalOutputPath = path.join(outputFolder, finalOutputName);

                    if (!await fileExists(tempRawTilePath)) {
                        console.warn(`Tile ${tempRawTilePath} not found after cropping. This might happen if the input image was not a 3x3 grid. Skipping.`);
                        continue;
                    }

                    // 2a. Trim transparency
                    const trimCommand = `magick convert "${tempRawTilePath}" -trim +repage "${tempTrimmedTilePath}"`;
                    // console.log(`Executing: ${trimCommand}`);
                    await execAsync(trimCommand);

                    // 2b, 2c, 2d. Resize content, create canvas with padding, and composite
                    // The \\> ensures image is only shrunk if larger, maintaining aspect ratio, fitting within TARGET_ICON_DIMENSION.
                    const resizeAndPadCommand = `magick convert "${tempTrimmedTilePath}" -resize ${TARGET_ICON_DIMENSION}x${TARGET_ICON_DIMENSION}\\> -background transparent -gravity center -extent ${FINAL_CANVAS_DIMENSION}x${FINAL_CANVAS_DIMENSION} "${finalOutputPath}"`;
                    // console.log(`Executing: ${resizeAndPadCommand}`);
                    await execAsync(resizeAndPadCommand);
                    
                    console.log(`Processed and saved ${finalOutputPath}`);
                }
            } finally {
                // Clean up temporary tile directory
                await fs.rm(tempTileDir, { recursive: true, force: true });
                console.log(`Cleaned up temporary directory ${tempTileDir}`);
            }
        }
        console.log("\nAll images processed successfully!");

    } catch (error) {
        console.error("An error occurred:", error);
        if (error && typeof error === 'object' && 'stderr' in error) {
             console.error("ImageMagick stderr:", (error as any).stderr);
        }
        if (error && typeof error === 'object' && 'stdout' in error) {
            console.error("ImageMagick stdout:", (error as any).stdout);
       }
        process.exit(1);
    }
}

main();
