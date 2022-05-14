
import alfy from "alfy";
import sample from "lodash.sample"
import union from "lodash.union"
import difference from "lodash.difference"

const FIXED_KEY = [
    {
        keyfrom: 'CoderVar',
        key: '802458398'
    },
    {
        keyfrom: 'whatMean',
        key: '1933652137'
    },
    {
        keyfrom: 'chinacache',
        key: '1247577973'
    },
    {
        keyfrom: 'huipblog',
        key: '439918742'
    },
    {
        keyfrom: 'chinacache',
        key: '1247577973'
    },
    {
        keyfrom: 'fanyi-node',
        key: '593554388'
    },
    {
        keyfrom: 'wbinglee',
        key: '1127870837'
    },
    {
        keyfrom: 'forum3',
        key: '1268771022'
    },
    {
        keyfrom: 'node-translator',
        key: '2058911035'
    },
    {
        keyfrom: 'kaiyao-robot',
        key: '2016811247'
    },
    {
        keyfrom: 'stone2083',
        key: '1576383390'
    },
    {
        keyfrom: 'myWebsite',
        key: '423366321'
    },
    {
        keyfrom: 'leecade',
        key: '54015339'
    },
    {
        keyfrom: 'github-wdict',
        key: '619541059'
    },
    {
        keyfrom: 'lanyuejin',
        key: '2033774719'
    },
];

let selected = sample(FIXED_KEY);
const result = await alfy.fetch('http://fanyi.youdao.com/openapi.do', {
    searchParams: {
        keyfrom: selected.keyfrom,
        key: selected.key,
        type: 'data',
        doctype: 'json',
        version: '1.1',
        q: alfy.input
    }
})
if (result.errorCode === 0) {
    // 过滤中文
    let reg = /^[a-zA-Z ]/; // .filter(i => reg.test(i))
    // 标准翻译结果 : translation
    const translationItems = result.translation.map(i => ({
        title: i,
        subtitle: `标准翻译 => ${i}`,
        arg: i,
    }))
    // 网络翻译 : web
    const webItems = result.web?.flatMap(i => i.value).map(i => ({
        title: i,
        subtitle: `网络翻译 => ${i}`,
        arg: i,
    })) || []
    const items = [
        ...translationItems,
        ...webItems
    ].map(i => {
        const strArr = difference(i.title.toLowerCase().split(' '),
            union(['and', 'or', 'the', 'a', 'at', 'of'], [], ['ing', 'ed', 'ly'], ['was']));
        // df
        const bigHumpArr = [...strArr]
        // cl
        const namedConstArr = [...strArr]
        const humpArr = [...strArr]
        for (let i = 0; i < strArr.length; i++) {
            if (i === 0) {
                humpArr[i] = humpArr[i].charAt(0).toLowerCase() + humpArr[i].substring(1);
            } else {
                humpArr[i] = humpArr[i].charAt(0).toUpperCase() + humpArr[i].substring(1);
            }
            bigHumpArr[i] = bigHumpArr[i].charAt(0).toUpperCase() + bigHumpArr[i].substring(1);
        }
        // df
        const bigHump = bigHumpArr.join('');
        // xt
        const hump = humpArr.join('');
        // zh
        const hyphen = strArr.join('-').toLowerCase();
        // xh
        const underline = strArr.join('_').toLowerCase();
        // cl
        const namedConst = strArr.join('_').toUpperCase()
        return {
            ...i,
            mods: {
                cmd: {
                    arg: hump,
                    subtitle: `驼峰式命名法 => ${hump}`,
                },
                alt: {
                    arg: bigHump,
                    subtitle: `帕斯卡命名法/大驼峰式命名法 => ${bigHump}`,
                },
                fn: {
                    arg: hyphen,
                    subtitle: `中划线命名法 => ${hyphen}`,
                },
                ctrl: {
                    arg: underline,
                    subtitle: `下划线命名法 => ${underline}`,
                },
                shift: {
                    arg: namedConst,
                    subtitle: `全大写下划线命名法/常量 => ${namedConst}`,
                },
            },
        }
    })
    alfy.output(items);
} else {
    alfy.output([{
        title: '抱歉',
        subtitle: `无相关记录`,
        arg: 'error',
    }]);
}