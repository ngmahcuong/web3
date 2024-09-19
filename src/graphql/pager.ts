import { GraphQLClient } from 'graphql-request';
import { PAGE_SIZE } from '../utils/constants';

export const pager = async <T>(query, variables, client: GraphQLClient): Promise<T> => {
  const data: any = {};
  let skip = 0;
  let flag = true;
  variables = { ...variables, skip };
  while (flag) {
    flag = false;
    const req = await client.request(query, variables);

    Object.keys(req).forEach((key) => {
      data[key] = data[key] ? [...data[key], ...req[key]] : req[key];
    });

    // eslint-disable-next-line no-loop-func
    Object.values(req).forEach((entry: any) => {
      if (entry.length === PAGE_SIZE) flag = true;
    });

    if (Object.keys(variables).includes('first') && variables['first'] !== undefined) break;

    skip += PAGE_SIZE;
    variables = { ...variables, skip };
  }
  return data;
};
