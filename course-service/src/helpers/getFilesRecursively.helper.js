// import fs from 'fs/promises';
// import path from 'path';

// // Get all files from output directory recursively (ASYNC)
// export async function getFilesRecursively(dir) {
//     let results = [];

//     try {
//         const list = await fs.readdir(dir);

//         for (const file of list) {
//             const filePath = path.join(dir, file);
//             const stat = await fs.stat(filePath);

//             if (stat.isDirectory()) {
//                 results = results.concat(await getFilesRecursively(filePath));
//             } else {
//                 results.push(filePath);
//             }
//         }
//     } catch (error) {
//         console.error(`Error reading directory ${dir}:`, error);
//     }

//     return results;
// }

import fs from 'fs';
import path from 'path';

// Get all files from output directory recursively
function getFilesRecursively(dir) {
    let results = [];
    if (!fs.existsSync(dir)) {
        console.error(`Directory not found: ${dir}`);
        return results;  // Ensure it always returns an array
    }

    const list = fs.readdirSync(dir);

    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(getFilesRecursively(filePath));
        } else {
            results.push(filePath);
        }
    });

    return results;  // Ensure this function always returns an array
}

export { getFilesRecursively };
