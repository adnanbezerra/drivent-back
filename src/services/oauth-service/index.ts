import { unauthorizedError } from '@/errors';
import axios from 'axios';
import qs from 'query-string';
import { unregisteredUserError } from '../authentication-service';
import sessionRepository from '@/repositories/session-repository';

export async function oAuthLogin(code: string){

    const token:any = await exchangeCodeForAccessToken(code);
    //console.log(token);
    if (!token) throw unregisteredUserError();

    const user = await fetchUser(token);
    //console.log(user);
    if (!user) throw unauthorizedError();
    const userId = user.id;

    return {token, user};
}

async function exchangeCodeForAccessToken(code:string) {
    const GITHUB_ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
    const { REDIRECT_URL, CLIENT_ID, CLIENT_SECRET } = process.env;
    const params = {
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URL,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    };
  
    const { data } = await axios.post(GITHUB_ACCESS_TOKEN_URL, params, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  
    const parsedData = qs.parse(data);
    return parsedData.access_token;
  }

  async function fetchUser(token:string) {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  
    return response.data;
  }
