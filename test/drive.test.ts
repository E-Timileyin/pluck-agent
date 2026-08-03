import { describe, expect, it } from 'vitest';
import { toSlidesEmbed, toVideoEmbed } from '../src/lib/drive';

describe('toSlidesEmbed', () => {
  it('turns a presentation share link into an embed URL', () => {
    expect(toSlidesEmbed('https://docs.google.com/presentation/d/ABC-123_xyz/edit#slide=id.p1')).toBe(
      'https://docs.google.com/presentation/d/ABC-123_xyz/embed?start=false&loop=false',
    );
  });

  it('rejects a video link and empty input', () => {
    expect(toSlidesEmbed('https://drive.google.com/file/d/ABC123/view')).toBeNull();
    expect(toSlidesEmbed('  ')).toBeNull();
  });
});

describe('toVideoEmbed', () => {
  it('turns a Drive file share link into a preview URL', () => {
    expect(toVideoEmbed('https://drive.google.com/file/d/ABC-123_xyz/view?usp=sharing')).toBe(
      'https://drive.google.com/file/d/ABC-123_xyz/preview',
    );
  });

  it('rejects a slides link and anything unparseable', () => {
    expect(toVideoEmbed('https://docs.google.com/presentation/d/ABC123/edit')).toBeNull();
    expect(toVideoEmbed('not a url')).toBeNull();
  });
});
