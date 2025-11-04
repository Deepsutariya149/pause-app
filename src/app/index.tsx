import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { storage } from '../utils/storage';
import { authService } from '../services/auth.service';

export default function Index() {
  return <Redirect href="/_layout" />;
}


