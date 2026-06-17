import { faker } from '@faker-js/faker'
import { userIdSchema } from '@iut-intranet/helpers/schemas/brand'
import { ContentType } from '@iut-intranet/helpers/schemas/storage'
import { createDbUserFixture } from '@tests/fixtures/user.fixture'

import { userService } from '@/index'

// S3 est entièrement mocké : les tests ne touchent jamais le stockage réel.
const { mockGetSignedObjectUrl, mockUpdateObject, mockUploadObject } =
  vi.hoisted(() => ({
    mockGetSignedObjectUrl: vi.fn(),
    mockUpdateObject: vi.fn(),
    mockUploadObject: vi.fn(),
  }))

vi.mock('@iut-intranet/providers/s3', () => ({
  getSignedObjectUrl: mockGetSignedObjectUrl,
  signUrlField: async (item: unknown, field: string) => {
    if (!item || typeof item !== 'object') return item

    const safeItem = item as Record<string, unknown>
    const mockUrl = await mockGetSignedObjectUrl()

    return {
      ...safeItem,
      [field]: safeItem[field] ? mockUrl : null,
    }
  },
  StorageFolders: { highlights: 'highlights', news: 'news', users: 'users' },
  updateObject: mockUpdateObject,
  uploadObject: mockUploadObject,
}))

describe('UserService', () => {
  beforeEach(() => {
    mockGetSignedObjectUrl
      .mockReset()
      .mockResolvedValue('https://signed.example/avatar.png')
    mockUploadObject.mockReset()
    mockUpdateObject.mockReset()
  })

  describe('getById', () => {
    it('should return the user matching the id', async () => {
      const user = await createDbUserFixture()

      const result = await userService.getById(
        userIdSchema.parse(user.id),
        user.id,
      )

      expect(result).toMatchObject({ email: user.email, id: user.id })
    })
  })

  describe('list', () => {
    it('should return a paginated list including the created user', async () => {
      const user = await createDbUserFixture()

      const result = await userService.list({ page: 1, pageSize: 100 })

      expect(result.total).toBeGreaterThan(0)
      expect(result.items.some((item) => item.id === user.id)).toBe(true)
    })

    it('should narrow the results with a search term', async () => {
      const user = await createDbUserFixture()

      const result = await userService.list({
        page: 1,
        pageSize: 100,
        search: user.lastName,
      })

      expect(result.items.some((item) => item.id === user.id)).toBe(true)
    })
  })

  describe('updateUser', () => {
    it('should persist the updated fields', async () => {
      const user = await createDbUserFixture()
      const lastName = faker.person.lastName().toUpperCase()

      const result = await userService.updateUser(
        { lastName },
        userIdSchema.parse(user.id),
      )

      expect(result.lastName).toBe(lastName)
    })
  })

  describe('uploadAvatar', () => {
    it('should upload a fresh avatar and persist its signed url', async () => {
      const user = await createDbUserFixture()
      const uploadedKey = `users/${user.id}/avatar.png`
      const signedUrl = 'https://signed.example/fresh.png'
      mockUploadObject.mockResolvedValueOnce(uploadedKey)
      mockGetSignedObjectUrl.mockResolvedValueOnce(signedUrl)

      const payload = {
        base64: Buffer.from('avatar').toString('base64'),
        contentType: ContentType.IMAGE_PNG,
      }

      const result = await userService.uploadAvatar(
        payload,
        userIdSchema.parse(user.id),
      )

      expect(mockUploadObject).toHaveBeenCalledWith({
        ...payload,
        fileName: 'avatar',
        folder: 'users',
        subFolder: user.id,
      })
      expect(result.image).toBe(signedUrl)
    })
  })
})
