export interface HerokuBuild {
    app: {
        id: string
    },
    buildpacks: {
        url: string
        name?: string
    }[]
    created_at: string
    id: string
    output_stream_url: string
    release: string
    slug: string
    source_blob: {
        checksum: string
        url: string
        version: string
        version_description: string
    },
    stack: string
    status: string
    updated_at: string
    user: {
        email: string
        id: string
    }
}
