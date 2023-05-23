import { ApiProperty } from '@nestjs/swagger'

export enum EditorBlockType {
    'paragraph' = 'paragraph',
    'heading' = 'heading',
    'audio' = 'audio',
    'video' = 'video',
    'image' = 'image',
    'radio' = 'radio',
    'checkbox' = 'checkbox',
    'input' = 'input'
}

export class Option {
    @ApiProperty()
        value: string

    @ApiProperty()
        isCorrect: boolean
}

type TAbstractBlock = {
    id: string
}

export type TEditorBlockParagraph = TAbstractBlock & {
    type: EditorBlockType.paragraph,
    data: {
        text: string
    }
}

export type TEditorBlockHeading = TAbstractBlock & {
    type: EditorBlockType.heading,
    data: {
        text: string
    }
}

export type TEditorBlockImage = TAbstractBlock & {
    type: EditorBlockType.image,
    data: {
        url: string
    }
}

export type TEditorBlockAudio = TAbstractBlock & {
    type: EditorBlockType.audio,
    data: {
        url: string
    }
}

export type TEditorBlockVideo = TAbstractBlock & {
    type: EditorBlockType.video,
    data: {
        videoId: string
    }
}

export type TEditorBlockRadio = TAbstractBlock & {
    type: EditorBlockType.radio,
    data: {
        options: Option[]
    }
}

export type TEditorBlockCheckbox = TAbstractBlock & {
    type: EditorBlockType.checkbox,
    data: {
        options: Option[]
    }
}

export type TEditorBlockInput = TAbstractBlock & {
    type: EditorBlockType.input,
    data: {
        text: string
    }
}

export type TEditorBlockUnknown = TAbstractBlock & {
    type: EditorBlockType,
    data: Record<string, unknown>
}

export type TEditorBlock = TEditorBlockParagraph | TEditorBlockHeading | TEditorBlockImage |
TEditorBlockAudio | TEditorBlockVideo | TEditorBlockRadio | TEditorBlockCheckbox |
TEditorBlockInput | TEditorBlockUnknown
