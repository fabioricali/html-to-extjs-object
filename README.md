# Extml

## Overview

Extml simplifies the creation and management of ExtJS components through an intuitive HTML-based markup system. It enables reactive programming, dynamic state handling, and seamless integration with ExtJS's modern toolkit.

---

## Table of Contents

- [Core Concepts](#core-concepts)
- [Installation](#installation)
- [Examples](#examples)
  - [Basic Example](#basic-example)
  - [Advanced Example](#advanced-example)
  - [Integration with ExtJS Application](#integration-with-extjs-application)
  - [Using the For Component](#using-the-for-component)
- [Key Features](#key-features)
  - [State Management](#state-management)
  - [Reactive Components](#reactive-components)
  - [Scoped Styling](#scoped-styling)
- [Component Guidelines](#component-guidelines)
- [API Reference](#api-reference)
- [License](#license)

---

## Core Concepts

Extml allows developers to:

- **Leverage HTML Markup:** Create ExtJS components using simple HTML templates.
- **Reactive Programming:** Update components dynamically based on state changes.
- **Scoped Styling:** Define styles specific to components and their children.

---

## Installation

### Alternative Installation

Use Extml from a CDN:

- **UMD:** [https://cdn.jsdelivr.net/npm/extml/dist/extml.umd.min.js](https://cdn.jsdelivr.net/npm/extml/dist/extml.umd.min.js)
- **ES:** [https://cdn.jsdelivr.net/npm/extml/dist/extml.es.min.js](https://cdn.jsdelivr.net/npm/extml/dist/extml.es.min.js)

Install Extml via npm:

```bash
$ npm install -D extml
```

---

## Examples

### Live Demo

Try Extml live on [Sencha Fiddle](https://fiddle.sencha.com/#view/editor\&fiddle/3lv6).

### Basic Example

```javascript
import { h } from 'extml';

function myButton() {
    return h`
        <ext-button text="Click Me" ontap=${() => alert('Button clicked!')} />
    `;
}

const component = myButton();
console.log(component);
/* Outputs:
{
  xtype: 'button',
  text: 'Click Me',
  listeners: [{ tap: [Function] }]
}
*/
```

### Advanced Example

```javascript
import {
    h,
    createState,
    createRef,
    createEffect,
    createDerivedState,
    conditionalState
} from "extml";

function timelineComponent() {
    const [currentTime, setCurrentTime] = createState(0);
    const [isPlaying, setIsPlaying] = createState(false);

    const currentRelativeTime = createDerivedState(() => {
        const time = currentTime();
        return time < 10 ? `0:0${time}` : `0:${time}`;
    });

    const videoRef = createRef();

    createEffect(() => {
        const video = videoRef();
        if (!video) return;

        video.addEventListener('timeupdate', () => setCurrentTime(video.currentTime));
        video.addEventListener('play', () => setIsPlaying(true));
        video.addEventListener('pause', () => setIsPlaying(false));
    }, [videoRef]);

    return h`
        <ext-container>
            <video ref=${videoRef} controls style="width: 100%;">
                <source src="example.mp4" type="video/mp4" />
            </video>
            <div>Current Time: ${currentRelativeTime}</div>
            <div>Status: ${conditionalState(isPlaying, 'Playing', 'Paused')}</div>
        </ext-container>
    `;
}

const component = timelineComponent();
console.log(component);
```

### Integration with ExtJS Application

```javascript
Ext.application({
    name : 'Fiddle',

    launch : function() {
        const { h } = window.extml;

        const myButton = function() {
            return h`
                <ext-button
                    text="Click me! (see the console)"
                    ontap=${(me) => console.log(me)}
                />
            `;
        };

        const myPanel = function() {
            return h`
                <style>
                    :component {
                        border: 4px solid red!important;
                        padding: 8px;
                    }
                    .my-div {
                        color: red;
                    }

                    .my-button {
                        font-size: 19px;
                    }
                </style>
                <ext-panel title="My Panel Title">
                    <${myButton}/>
                    <div class="my-div">
                        Html is allowed ;) <a href="https://www.google.it" target="_blank">Go to Google</a>
                        <ext-button class="my-button" text="Ext Button inside a div" ontap=${() => alert('hello')}/>
                        <div>the result of 1+2 is ${1+2}</div>
                    </div>
                </ext-panel>
            `;
        };

        this.viewport.add(myPanel());
    }
});
```

### Using the For Component

```javascript
import { h } from "extml";
import For from "./parser.js";

function listComponent(items) {
    return h`
        <ext-container>
            <${For}
                each=${items}
                getKey=${(item) => item.id}
                effect=${(item) => h`
                    <ext-panel title=${item.title}>
                        <div>${item.content}</div>
                    </ext-panel>
                `}
            />
        </ext-container>
    `;
}

const items = [
    { id: 1, title: "Item 1", content: "Content 1" },
    { id: 2, title: "Item 2", content: "Content 2" },
    { id: 3, title: "Item 3", content: "Content 3" }
];

const component = listComponent(items);
console.log(component);
```

---

## Key Features

### State Management

**Extml** provides a robust state management system:

- **`createState`**: Creates a reactive state.
- **`createDerivedState`**: Generates states derived from other states.
- **Example:**
  ```javascript
  const [value, setValue] = createState(0);
  setValue(value() + 1);
  ```

### Reactive Components

**`createEffect`** allows you to perform actions when dependencies change:

```javascript
createEffect(() => {
    console.log('Value changed:', value());
}, [value]);
```

### Scoped Styling

Define styles specific to a component using the `<style>` tag:

```javascript
h`
    <style>
        :component {
            color: red;
        }
    </style>
    <ext-button text="Styled Button" />
`;
```

---

## Component Guidelines

- **Component Tags:** All ExtJS component tags must use the `ext-` prefix (e.g., `<ext-button>`).
- **Event Listeners:** Use the `on` prefix for defining event listeners (e.g., `ontap` for the `tap` event).
- **HTML Compatibility:** You can mix native HTML tags with ExtJS components in your templates.
- **Scoped Styles:** Define component-specific styles within a `<style>` block.

---

## API Reference

### `toggleState`

**Description:** Toggles the value of a reactive state between `true` and `false`.

**Parameters:**

- `state` (function): The reactive state to toggle.

**Examples:**

1. Toggling a single boolean state:

   ```javascript
   import { createState, toggleState } from 'extml';

   const [myState] = createState(false);
   toggleState(myState);
   console.log(myState()); // true
   toggleState(myState);
   console.log(myState()); // false
   ```

2. Toggling a property within a state object:

   ```javascript
   import { createState, toggleState } from 'extml';

   const [state] = createState({ done: false, text: 'Hello' });
   toggleState(state.done);
   console.log(state.text()); // "Hello"
   console.log(state.done()); // true
   toggleState(state.done);
   console.log(state.done()); // false
   ```

### `createState`

**Description:** Creates a reactive state object.

**Parameters:**

- `initialValue` (any): Initial value of the state.

**Returns:** `[state, setState]`

### `createEffect`

**Description:** Executes a function when dependencies change.

**Parameters:**

- `effect` (function): The function to execute.
- `dependencies` (array): Reactive states to watch.

**Example:**

```javascript
createEffect(() => console.log(value()), [value]);
```

### `conditionalState`

**Description:** Creates a state that toggles between two values based on a condition.

**Parameters:**

- `state` (function): Reactive state.
- `trueValue` (any): Value when the condition is true.
- `falseValue` (any): Value when the condition is false.

**Example:**

```javascript
const isPositive = conditionalState(value, 'Positive', 'Negative');
```

### `createDerivedState`

**Description:** Generates a state derived from other states.

**Example:**

```javascript
const derived = createDerivedState(() => value() * 2);
```

### `createRef`

**Description:** Creates a reference object for DOM or component tracking.

### `createExtRef`

**Description:** Creates a reference object for tracking ExtJS components instead of DOM elements.

**Examples:**

```javascript
import { createExtRef } from 'extml';

const extRef = createExtRef();

// Later in your component:
h`
    <ext-panel ref=${extRef}></ext-panel>
`;

// Access the ExtJS component:
const extComponent = extRef();
console.log(extComponent.xtype); // "panel"
```

---

## License

Extml is open-source software licensed under the [MIT License](http://opensource.org/licenses/MIT).

---

## Author

[Fabio Ricali](http://rica.li)

