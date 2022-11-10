# extml
Converts html tagged templates to ExtJS component object

## Get started
```
$ npm install -D extml
```

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
## License
Extml is open-sourced software licensed under the <a target="_blank" href="http://opensource.org/licenses/MIT">MIT license</a>

## Author
<a target="_blank" href="http://rica.li">Fabio Ricali</a>