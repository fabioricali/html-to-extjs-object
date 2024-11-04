# extml
Converts html tagged templates to ExtJS component object.

## Get started
```
$ npm install -D extml
```

## Demo
<a target="_blank" href="https://fiddle.sencha.com/#view/editor&fiddle/3lv6">LIVE HERE</a>
## Develop (with local UMD file for testing)
<a target="_blank" href="https://fiddle.sencha.com/#fiddle/3sfr&view/editor">LIVE HERE</a>

## Example
```js
import {h} from 'extml';

function onPaintedHandle() {
    return 'foo';
}

let result = h`
    <ext-segmentedbutton allowMultiple=${true} onpainted=${onPaintedHandle}>
        <.../>
    </ext-segmentedbutton>
`;
// the "segmentedbutton" tag is referred to Extjs xtype property
console.log(result)
/*
{
  xtype: 'segmentedbutton',
  items: [...],
  listeners: [ { painted: [Function: onPaintedHandle] } ],
  allowMultiple: true
}
 */

//Define a scoped style for the component and his children
let result = h`
    <style>
        :component {
            border: 4px solid red;
        }
        .x-input-el {
            margin: auto;
        }
        .x-label-el {
            text-align: center;
        }
    </style>
    <ext-segmentedbutton allowMultiple=${true} onpainted=${onPaintedHandle}>
        <.../>
    </ext-segmentedbutton>
`;
```

## Things to know
- At the moment compatible with ***modern toolkit*** only.
- You can ***write html*** code together with ***Ext JS components***.
- All component tag must be defined with prefix ***"ext-"*** so it is possible to distinguish them from native html tags. 
- The component listeners must be defined with prefix ***"on"***, for example "tap" becomes ***"ontap"***.
- You can define a ***scoped style*** on top of each component.

## License
Extml is open-sourced software licensed under the <a target="_blank" href="http://opensource.org/licenses/MIT">MIT license</a>

## Author
<a target="_blank" href="http://rica.li">Fabio Ricali</a>