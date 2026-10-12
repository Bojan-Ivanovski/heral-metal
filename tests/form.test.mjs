import test from 'node:test';
import assert from 'node:assert/strict';
import { attachmentError, MAX_ATTACHMENT_BYTES } from '../src/lib/form.ts';
test('accepts supported files up to the documented provider limit', () => {
  for (const name of ['drawing.PDF', 'photo.jpeg', 'photo.JPG', 'plan.dwg', 'photo.png']) assert.equal(attachmentError({ name, size: MAX_ATTACHMENT_BYTES }), false);
});
test('rejects empty, oversized and unsupported attachments', () => {
  for (const file of [{ name: 'empty.pdf', size: 0 }, { name: 'large.pdf', size: MAX_ATTACHMENT_BYTES + 1 }, { name: 'drawing.pdf.exe', size: 100 }, { name: 'drawing', size: 100 }]) assert.equal(attachmentError(file), true);
});
