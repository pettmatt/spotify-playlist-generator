export function getSectionFromString(fullString: string, regex: RegExp[]): string | string[] {
    const matches = fullString.match(regex[0])
    const snippet = matches?.map(match =>
        match.replace(regex[1], "").replace(regex[2], "")
    )

    if (snippet) return snippet

    // If snippet is not found the function returns the full string
    return fullString
}

export function flattenArray(arr: []): [] {
    return arr.reduce((acc, val) => {
        if (Array.isArray(val)) acc.push(...flattenArray(val))
        else acc.push(val)
        return acc
    }, [])
}

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        [array[i], array[j]] = [array[j], array[i]]
    }

    return array
}

function splitArrayIntoThird(array: any[]) {
    const thirdLength = Math.floor(array.length / 3)

    const part1 = array.slice(0, thirdLength)
    const part2 = array.slice(thirdLength, 2 * thirdLength)
    const part3 = array.slice(2 * thirdLength)

    return [part1, part2, part3]
}

export function getRandomizePortionFromArray(array: any[]) {
    const randomized = shuffleArray(array)
    const split = splitArrayIntoThird(randomized)
    return split[0]
}