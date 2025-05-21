import {atom} from 'jotai';
import {UserProfileResponse} from '../../types/ApiResponse';

export const userAtom = atom<UserProfileResponse | undefined>(undefined);
