// 解析模板指令，将指令模板中的变量替换成数据，对视图进行初始化操作
// 遍历解析的过程有多次操作dom节点，为提高性能和效率，会先将跟节点el转换成文档碎片
// fragment进行解析编译操作，解析完成，再将fragment添加回原来的真实dom节点中
function Compile($el, vm) {
    this.$el = this.isElementNode($el) ? $el : document.querySelector($el);
    this._vm = vm;
    if (this.$el) {
    	this.$fragment = this.nodeToFragment(this.$el);
        this.compileElement(this.$fragment);
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
	nodeToFragment: function ($node) {
		var fragment = document.createDocumentFragment(),
			child;
		// 将原生节点拷贝到fragment中
		while (child = $node.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
	},
    // 1. 遍历结点
    // 2. 验证节点类型
    // 3. 匹配模版
    // 4. 替换变量
    compileElement: function ($el) {
        var self = this;
        var childNodes = $el.childNodes;
        [].slice.call(childNodes).forEach(function ($childNode) {
            if (self.isElementNode($childNode)) {
                // 解析节点，但不包括节点内部的文本
                self.compileElementNode($childNode);
                // 如果有子节点，解析子节点
                if ($childNode.childNodes && $childNode.childNodes.length) {
                    self.compileElement($childNode);
                }
            } else if (self.isTextNode($childNode)) {
                // 纯文本，解析文本中的模板区域
                self.compileTextNode($childNode);
            }
        })
    },

    compileElementNode: function ($node) {
    	var nodeAttrs = $node.attributes,
    		self = this;
    	[].slice.call(nodeAttrs).forEach(function (nodeAttr) {
    		var attrName = nodeAttr.name;
    		var dir;
    		// 规定以v-xxx为指令
    		if (dir = self.isDirective(attrName)) {
    			// 如果是指令，则进行指令解析
    			var attrValue = nodeAttr.value;
    			if (self.isEventDirective(dir)) {
    				// 事件指令，如v-on:click
    				compileUtils.eventCompile($node, self._vm, dir, attrValue);
    			} else if (self.isBindDirective(dir)) {
    				compileUtils.bind($node, self._vm, dir, attrValue);
    			} else {
    				// 普通指令
    				compileUtils[dir] && compileUtils[dir]($node, self._vm, dir, attrValue);
    			}
    		}
    	})
    },

    isDirective (attributeName) {
    	if (attributeName.indexOf("v-") === 0) {
    		return attributeName.substring(2);
    	} else if (attributeName.indexOf(":") === 0) {
    		return "bind" + attributeName;
    	} else if (attributeName.indexOf("@") === 0) {
    		return "on:" + attributeName.substring(1);
    	}
    },

    isBindDirective (directive) {
    	return directive.indexOf('bind') === 0;
    },

    isEventDirective (directive) {
    	return directive.indexOf('on') === 0;
    },

    compileTextNode: function ($node) {
        var text = $node.textContent;
        var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
        var match = defaultTagRE.exec(text);
        if (match) {
            compileUtils.text($node, this._vm, null, match[1]);
        }
    },

    // 验证节点类型 —— Node类型
    // DOM1级定义了一个Node接口，该接口将由DOM中所有节点类型实现。
    // （DOM中的所有节点类型组合实现了这一接口，通过该接口可以进行节点的一些操作和判断）
    // 每个节点都有一个nodeType属性，用于表明节点类型。
    // 节点类型由在Node类型中定义的12个数值常量来表示，任何节点类型必居其一。
    // Node.ELEMENT_NODE: 1
    // Node.ATTRIBUTE_NODE: 2
    // Node.TEXT_NODE: 3
    // Node.CDATA_SECTION_NODE: 4
    // Node.ENTITY_REFERENCE_NODE: 5
    // Node.ENTITY_NODE: 6
    // Node.PROCESSING_INSTRUCTION_NODE: 7
    // Node.COMMENT_NODE: 8
    // Node.DOCUMENT_NODE: 9
    // Node.DOCUMENT_TYPE_NODE: 10
    // Node.DOCUMENT_FRAGMENT_NODE: 11
    // Node.NOTATION_NODE: 12
    isElementNode ($node) {
        return $node.nodeType === 1;
    },
    isTextNode ($node) {
        return $node.nodeType === 3;
    }
}