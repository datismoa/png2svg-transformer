import { DoublyLinkedList } from './DoublyLinkedList.js'

export class Pool {
  works = new DoublyLinkedList()
  worksMeta = {}

  availableWorkers = 0

  locked = false

  onWorkDone = () => {}

  constructor(availableWorkers) {
    this.availableWorkers = availableWorkers
  }

  lock() {
    this.locked = true
  }

  unlock() {
    this.locked = false

    this.#runWork()
  }

  addWork(work) {
    this.works.append(work)

    this.#runWork()
  }

  async #runWork() {
    if (!this.#shouldRunNext()) return

    this.availableWorkers -= 1

    const work = this.works.removeHead().data

    const result = await work.fn()

    this.worksMeta[work.id] = result

    this.availableWorkers += 1

    this.onWorkDone(work.id, result)

    if (this.#shouldRunNext()) {
      this.#runWork()
    }
  }

  #shouldRunNext() {
    return !this.locked && this.availableWorkers > 0 && this.works.getSize() > 0
  }
}