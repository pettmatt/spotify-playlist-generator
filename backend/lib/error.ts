export function createErrorObject(response: Response) {
    return {
        error: {
            message: response.statusText,
            status: response.status,
            details: response,
        }
    }
}