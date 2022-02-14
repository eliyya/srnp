export class Embed {
    type: string | null
    iconURL?: string
    url?: string
    title?: string
    description?: string
    media?: string
    colour?: string

    constructor(options?: EmbedOptions) {
        this.type = options?.type ?? 'text'
        if (!options) return
        if (options.icon_url) this.iconURL = options.icon_url
        if (options.url) this.url = options.url
        if (options.title) this.title = options.title
        if (options.description) this.description = options.description
        if (options.media) this.media = options.media
        if (options.type) this.type = options.type
        if (options.colour) this.colour = options.colour
    }
}

export interface EmbedOptions {
    type: 'text'
    icon_url?: string
    url?: string
    title?: string
    description?: string
    media?: string
    colour?: string
}
