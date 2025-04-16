import { Roles } from "./roles.model"

export class Blog {
  id!: number
  title!: string
  postDate!: Date
  imgTitle!: string
  content!: string
  imageBlog!: boolean
  discription!: string
  roles!: Roles[]
}
