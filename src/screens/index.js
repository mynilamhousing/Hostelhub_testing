/**
 * Screen factory — binds every screen object to one driver instance.
 * Harnesses (web / native) only ever call makeScreens(driver).
 */
import { LoginScreen, RegisterScreen, ForgotPasswordScreen } from './auth.screens.js';
import {
  DashboardScreen,
  InmatesScreen,
  AddInmateScreen,
  PollsScreen,
  MoreScreen,
  OpsScreen,
} from './app.screens.js';

export function makeScreens(driver) {
  return {
    login: new LoginScreen(driver),
    register: new RegisterScreen(driver),
    forgotPassword: new ForgotPasswordScreen(driver),
    dashboard: new DashboardScreen(driver),
    inmates: new InmatesScreen(driver),
    addInmate: new AddInmateScreen(driver),
    polls: new PollsScreen(driver),
    more: new MoreScreen(driver),
    ops: new OpsScreen(driver),
  };
}
