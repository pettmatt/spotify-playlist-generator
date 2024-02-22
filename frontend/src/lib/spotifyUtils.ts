export function getSnippetFromString(fullString: string, regex: RegExp[]): string | string[] {
    const matches = fullString.match(regex[0])
    const snippet = matches?.map(match => match.replace(regex[1], ""))

    if (snippet) return snippet

    // If snippet is not found the function returns the full string
    return fullString
}
