# extml
Converts html tagged templates to ExtJS component object

## Get started
```
$ npm install -D extml
```

## Example
```js
import extml from 'extml';

function onPaintedHandle() {
    return 'foo';
}
let result = extml`
    <segmentedbutton allowMultiple="${true}" onpainted="${onPaintedHandle}">
        <.../>
    </segmentedbutton>
`;
// the "segmentedbutton" tag is referred to Extjs xtype property
console.log(result)
/*
{
  xtype: 'segmentedbutton',
  items: [...],
  listeners: [ { painted: [Function: onPaintedHandle] } ],
  html: '',
  allowMultiple: true
}
 */
```
## License
Extml is open-sourced software licensed under the <a target="_blank" href="http://opensource.org/licenses/MIT">MIT license</a>

## Author
<a target="_blank" href="http://rica.li">Fabio Ricali</a>