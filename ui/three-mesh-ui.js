/* global global */

import Block from "./components/Block.js"
import Text from "./components/Text.js"
import InlineBlock from "./components/InlineBlock.js"
import Keyboard from "./components/Keyboard.js"
import UpdateManager from "./components/core/UpdateManager.js"
import FontLibrary from "./components/core/FontLibrary.js"
import * as TextAlign from "./utils/inline-layout/TextAlign.js"
import * as Whitespace from "./utils/inline-layout/Whitespace.js"
import * as JustifyContent from "./utils/block-layout/JustifyContent.js"
import * as AlignItems from "./utils/block-layout/AlignItems.js"
import * as ContentDirection from "./utils/block-layout/ContentDirection.js"

const update = () => UpdateManager.update()

const ThreeMeshUI = {
  Block,
  Text,
  InlineBlock,
  Keyboard,
  FontLibrary,
  update,
  TextAlign,
  Whitespace,
  JustifyContent,
  AlignItems,
  ContentDirection,
}

if (typeof global !== "undefined") global.ThreeMeshUI = ThreeMeshUI

export { Block }
export { Text }
export { InlineBlock }
export { Keyboard }
export { FontLibrary }
export { update }
export { TextAlign }
export { Whitespace }
export { JustifyContent }
export { AlignItems }
export { ContentDirection }

export default ThreeMeshUI
