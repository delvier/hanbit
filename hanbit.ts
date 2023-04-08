import * as Jimp from "jimp";
import * as m from "minimist";

let argv = m(process.argv.slice(2));

let x: number = parseInt(argv.x);
let y: number = parseInt(argv.y);
let input: string = argv.i;
let text: string = argv._[0] ?? "다람쥐 헌 쳇바퀴에 타고파\n제맥습있까굘";
let output: string = argv.o ?? "output.png";
let lines = text.split('\n');
let lengths = lines.map(x => x.length);

new Jimp(x * Math.max(...lengths), y * lines.length, "#FFFFFF", async (e, i) => {
    if (e) throw e;
    for (let j = 0; j < lines.length; j++) {
        for (let k = 0; k < lengths[j]; k++) {
            let c = hang_to_lvt(lines[j][k]);
            if (c[0] >= 0) {
                let ii = await genSyllable(...c);
                i = i.composite(ii, k * x, j * y);
            } else {
                let ii = new Jimp(x, y, "#FFFFFF");
                i = i.composite(ii, k * x, j * y);
            }
        }
    }
    i.write(output);
});

function hang_to_lvt(char: string): [number, number, number] {
    let c: number | undefined = char.codePointAt(0);
    if (typeof c === 'undefined') {
        c = 0;
    }
    if (c >= 0xAC00 && c < 0xD7A4) {
        let a: number = c - 0xAC00;
        let t: number = a % 28; //jongseong
        let v: number = ((a / 28) | 0) % 21; //jungseong
        let l: number = ((a / (28 * 21)) | 0) % 19; //choseong
        return [l, v, t];
    } else {
        return [-1, -1, 0x20];
    }
}

function component_numbers(l: number, v: number, t: number): [number, number, number] {
    //  A Ae YaYae Eo  EYeo Ye  O WaWae Oe Yo  U Wo We Wi Yu  U Ui  I
    const typel_from_lV = [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 1, 2, 4, 4, 4, 2, 1, 3, 0
    ];
    const typel_from_lVt = [
        5, 5, 5, 5, 5, 5, 5, 5, 6, 7, 7, 7, 6, 6, 7, 7, 7, 6, 6, 7, 5
    ];
    const typet_from_lVt = [
        0, 2, 0, 2, 1, 2, 1, 2, 3, 0, 2, 1, 3, 3, 1, 2, 1, 3, 3, 1, 1
    ];
    let lc: number;
    if (t === 0) {
        lc = typel_from_lV[v];
    } else {
        lc = typel_from_lVt[v];
    }
    let vc = (t === 0) ? 0 : 2;
    vc += (l === 0 || l === 15) ? 0 : 1;
    let tc = typet_from_lVt[v];
    return [lc, vc, tc];
}

async function genSyllable(l: number, v: number, t: number): Promise<Jimp> {
    let z = component_numbers(l, v, t);
    let lc = z[0];
    let vc = z[1];
    let tc = z[2];
    let q = await Jimp.read(input);
    let il = q.clone().crop(l * x, lc * y, x, y);
    let iv = q.clone().crop(v * x, 8 * y + vc * y, x, y);
    let it = q.clone().crop(t * x, 12 * y + tc * y, x, y);
    let i = new Jimp(x, y, "#FFFFFF");
    i.composite(il, 0, 0, {mode: Jimp.BLEND_MULTIPLY, opacitySource: 1, opacityDest: 1});
    i.composite(iv, 0, 0, {mode: Jimp.BLEND_MULTIPLY, opacitySource: 1, opacityDest: 1});
    i.composite(it, 0, 0, {mode: Jimp.BLEND_MULTIPLY, opacitySource: 1, opacityDest: 1});
    return i;
}