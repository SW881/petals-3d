import { CONFIG_VARS } from '../../config/constants.config'
const { API_ENDPOINT } = CONFIG_VARS

// User
export const SIGNUP_USER = API_ENDPOINT + `/user/signup`
export const SIGNIN_USER = API_ENDPOINT + `/user/signin`
export const SIGNOUT_USER = API_ENDPOINT + `/user/signout`
export const ME_USER = API_ENDPOINT + `/user/me`

// Folders
export const CREATE_FOLDER = API_ENDPOINT + `/folder/create`
export const DELETE_FOLDER = API_ENDPOINT + `/folder/delete`
export const FETECH_FOLDER_BY_ID = API_ENDPOINT + `/folder/get`
export const FETECH_ALL_FOLDERS = API_ENDPOINT + `/folder/get/all`

// Notes
export const CREATE_NOTE = API_ENDPOINT + `/note/create`
export const DELETE_NOTE = API_ENDPOINT + `/note/delete`
export const FETECH_NOTE_BY_ID = API_ENDPOINT + `/note/get`
export const FETECH_ALL_NOTES = API_ENDPOINT + `/note/get/all`

export const ADD_NOTE_DATA = API_ENDPOINT + '/line/create/bulk'
export const ADD_GROUPS_DATA = API_ENDPOINT + '/groups/create/bulk'
