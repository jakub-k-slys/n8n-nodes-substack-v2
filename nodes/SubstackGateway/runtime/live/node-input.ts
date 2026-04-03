import { Layer } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import { NodeInput } from '../node-input';
import { readSelection } from './read-input-shared';
import { readDraftInput } from '../resources/draft/read-input';
import { readNoteInput } from '../resources/note/read-input';
import { readOwnPublicationInput } from '../resources/own-publication/read-input';
import { readPostInput } from '../resources/post/read-input';
import { readProfileInput } from '../resources/profile/read-input';

export const makeNodeInputLayer = (context: IExecuteFunctions, itemIndex: number) =>
	Layer.succeed(NodeInput, {
		getSelection: readSelection(context, itemIndex),
		getOwnPublicationInput: (operation) => readOwnPublicationInput(context, itemIndex, operation),
		getNoteInput: (operation) => readNoteInput(context, itemIndex, operation),
		getDraftInput: (operation) => readDraftInput(context, itemIndex, operation),
		getPostInput: (operation) => readPostInput(context, itemIndex, operation),
		getProfileInput: (operation) => readProfileInput(context, itemIndex, operation),
	});
