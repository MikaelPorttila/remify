// Credit: https://vanillajstoolkit.com/polyfills/stringreplaceall/
export function replaceAll(target: string, str: string, newStr: string): string {
    if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
        return target.replace(str, newStr);
    }

    return target.replace(new RegExp(str, 'g'), newStr);
}