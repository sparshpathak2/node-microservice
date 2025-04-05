export async function retryOperation(operation, maxRetries = 3, initialDelay = 2000) {
    let attempt = 0;
    let delay = initialDelay;

    while (attempt < maxRetries) {
        try {
            return await operation();
        } catch (error) {
            attempt++;
            console.error(`❌ Attempt ${attempt} failed:`, error.message);

            if (attempt < maxRetries) {
                console.log(`🔄 Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                console.log(`🚨 Max retries reached. Skipping.`);
                throw new Error("MaxRetriesExceeded");
            }
        }
    }
}
