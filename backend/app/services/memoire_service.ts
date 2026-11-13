import Memoire, { type MemoireDoc } from '#models/memoire'
import { InvalidInputError } from '#exceptions/domain_error'

const SINGLETON_ID = 1
// Images are stored as /api/images URLs, so 2 MB of JSON is a very long text.
const MAX_CONTENT_BYTES = 2 * 1024 * 1024

export default class MemoireService {
  find() {
    return Memoire.find(SINGLETON_ID)
  }

  async save(content: MemoireDoc) {
    if (Buffer.byteLength(JSON.stringify(content)) > MAX_CONTENT_BYTES) {
      throw new InvalidInputError('content must be at most 2 MB', 'content')
    }
    return Memoire.updateOrCreate({ id: SINGLETON_ID }, { content })
  }
}
