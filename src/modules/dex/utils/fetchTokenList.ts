import { TokenList } from '@uniswap/token-lists';
import uriToHttp from './uriToHttp';
import schema from '@uniswap/token-lists/src/tokenlist.schema.json';
import Ajv from 'ajv';

const listCache = new Map<string, TokenList>();
const tokenListValidator = new Ajv({ allErrors: true }).compile(schema);

/**
 * Contains the logic for resolving a list URL to a validated token list
 * @param listUrl list url
 */
export default async function fetchTokenList(listUrl: string): Promise<TokenList> {
  const cached = listCache?.get(listUrl); // avoid spurious re-fetches
  if (cached) {
    return cached;
  }

  const urls = uriToHttp(listUrl);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const isLast = i === urls.length - 1;
    let response;
    try {
      response = await fetch(url, { credentials: 'omit' });
    } catch (error) {
      const message = `failed to fetch list: ${listUrl}`;
      console.debug(message, error);
      if (isLast) throw new Error(message);
      continue;
    }

    if (!response.ok) {
      const message = `failed to fetch list: ${listUrl}`;
      console.debug(message, response.statusText);
      if (isLast) throw new Error(message);
      continue;
    }

    const json = await response.json();
    if (!tokenListValidator(json)) {
      const validationErrors: string =
        tokenListValidator.errors?.reduce<string>((memo, error) => {
          const add = `${error.dataPath} ${error.message ?? ''}`;
          return memo.length > 0 ? `${memo}; ${add}` : `${add}`;
        }, '') ?? 'unknown error';
      throw new Error(`Token list failed validation: ${validationErrors}`);
    }
    listCache?.set(listUrl, json);
    return json;
  }

  throw new Error('Unrecognized list URL protocol.');
}
