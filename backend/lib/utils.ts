export function generateRandomString(stringLength: number): String {
    if (stringLength % 2 == 1)
        throw new Deno.errors.InvalidData("Only even sizes are supported")

    const buf = new Uint8Array(stringLength / 2)
    crypto.getRandomValues(buf)
    let randomString = ""

    for (let i = 0; i < buf.length; ++i) {
        randomString += ("0" + buf[i].toString(16)).slice(-2)
    }

    return randomString
}