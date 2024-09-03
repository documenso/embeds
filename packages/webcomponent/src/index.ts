import register from 'preact-custom-element';

import { EmbedDirectTemplate, EmbedSignDocument } from '@documenso/embed-preact';

register(EmbedDirectTemplate, 'documenso-embed-direct-template', [
  'token',
  'host',
  'externalId',
  'css',
  'email',
  'lockEmail',
  'name',
  'lockName',
  'onDocumentReady',
  'onDocumentCompleted',
  'onDocumentError',
]);

register(EmbedSignDocument, 'documenso-embed-sign-document', [
  'token',
  'host',
  'css',
  'name',
  'lockName',
  'onDocumentReady',
  'onDocumentCompleted',
  'onDocumentError',
]);
