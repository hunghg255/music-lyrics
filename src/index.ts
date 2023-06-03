// @ts-ignore
import * as cheerio from 'cheerio';
// @ts-ignore
import * as request from 'superagent';

async function find(link: string) {
  try {
    let lyric = '';

    const rest = await request.get(link);

    const $ = cheerio.load(rest.text);

    if (link.includes('https://www.letras.mus.br/') || link.includes('https://www.letras.com/')) {
      lyric = $('.cnt-letra.p402_premium').toString().replaceAll(/<.*?>/g, '\n').trim();

      if (!lyric) {
        lyric = $('.cnt-letra').toString().replaceAll(/<.*?>/g, '\n').trim();
      }
    } else if (link.includes('https://www.letras.com.br/')) {
      lyric = $('.lyrics-section').toString().replaceAll(/<.*?>/g, '\n').trim();
    } else if (link.includes('https://www.musixmatch.com/')) {
      lyric = $('.lyrics__content__ok').toString().replaceAll(/<.*?>/g, '');
    } else if (link.includes('https://www.vagalume.com.br/')) {
      lyric = $('div[id="lyrics"]').toString().replaceAll(/<.*?>/g, '\n').trim();
    }

    return lyric;
  } catch {
    throw new Error('Error');
  }
}

function isLink(link: string) {
  const mus = 'https://www.letras.mus.br/';
  const letter = 'https://www.letras.com/';
  const letterbr = 'https://www.letras.com.br/';
  const musix = 'https://www.musixmatch.com/';
  const vagalume = 'https://www.vagalume.com.br/';

  const regex = /(https?:\/\/)?[.a-z-]+\/.+/gi;

  return (
    regex.test(link) &&
    (link.includes(mus) ||
      link.includes(letter) ||
      link.includes(letterbr) ||
      link.includes(musix) ||
      link.includes(vagalume))
  );
}

export const SearchLyrics = async (title: string) => {
  try {
    const rest = await request.get(
      `https://www.google.com/search?q=${encodeURIComponent(title || '')}+letra`,
    );
    const $ = cheerio.load(rest.text);

    const values: string[] = [];

    $('a').each(function (_: any, link: any) {
      const url: any = $(link)?.attr('href')?.replace('/url?q=', '').split('&')[0] ?? [];

      if (url[0] === '/') {
        return;
      }

      if (!isLink(url)) {
        return;
      }

      values.push(url);
    });

    const link = values[0];

    const value = await find(link);

    if (!link || !value) {
      throw new Error('URL or lyrics not found!');
    }

    return value;
  } catch (error) {
    return error;
  }
};
