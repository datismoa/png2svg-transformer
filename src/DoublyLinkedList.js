export class DoublyLinkedList {
  append(data) {
    const node = this.#createNode(data)

    if (this.isEmpty()) {
      this.#head = node
      this.#tail = node
    }

    else {
      node.prevNode = this.#tail

      this.#tail.nextNode = node
      this.#tail = node
    }

    this.#onAddHook()

    return true
  }

  prepend(data) {
    if (this.isEmpty()) {
      return this.append(data)
    }

    const node = this.#createNode(data)

    node.nextNode = this.#head

    this.#head.prevNode = node
    this.#head = node

    this.#onAddHook()

    return true
  }

  removeHead() {
    if (this.isEmpty()) {
      return null
    }

    if (this.getSize() === 1) {
      return this.removeTail()
    }

    const headToRemove = this.#head

    this.#head = headToRemove.nextNode
    this.#head.prevNode = null

    this.#onRemoveHook()

    return headToRemove
  }

  removeTail() {
    if (this.isEmpty()) {
      return null
    }

    const tailToRemove = this.#tail

    if (this.getSize() === 1) {
      this.#head = null
      this.#tail = null
    }

    else {
      this.#tail = tailToRemove.prev
      this.#tail.nextNode = null
    }

    this.#onRemoveHook()

    return tailToRemove
  }

  getSize() {
    return this.#size
  }

  isEmpty() {
    return this.#size === 0
  }

  getHead() {
    return this.#head
  }

  getTail() {
    return this.#tail
  }

  *[Symbol.iterator]() {
    let node = this.#head

    while (node) {
      yield node.data

      node = node.nextNode
    }
  }

  #head = null
  #tail = null

  #size = 0

  #onAddHook() {
    this.#size += 1
  }

  #onRemoveHook() {
    this.#size -= 1
  }

  #createNode(data) {
    return new DoublyLinkedListNode(data)
  }
}

class DoublyLinkedListNode {
  data

  prevNode = null
  nextNode = null

  constructor(data) {
    this.data = data
  }
}