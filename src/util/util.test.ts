import {sanitizeCsvValue} from "./util"

it('can get context actions', () => {
    expect(sanitizeCsvValue('some,with,commas')).toEqual('"some,with,commas"')
    expect(sanitizeCsvValue('some"with"double"quotes')).toEqual('\"some\"\"with\"\"double\"\"quotes\"')
    expect(sanitizeCsvValue('WITH \nLINE BREAK')).toEqual('\"WITH \nLINE BREAK"')
});