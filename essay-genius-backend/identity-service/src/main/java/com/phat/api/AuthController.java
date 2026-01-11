package com.phat.api;

import com.phat.api.icontroller.IAuthController;
import com.phat.api.mapper.UserMapper;
import com.phat.api.model.request.*;
import com.phat.api.model.response.*;
import com.phat.app.exception.AppException;
import com.phat.app.service.AuthService;
import com.phat.app.service.UserService;
import com.phat.common.response.UserInfo;
import com.phat.domain.model.User;
import com.nimbusds.jose.JOSEException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

import static com.phat.app.exception.AppErrorCode.INVALID_SIGNATURE;
import static com.phat.common.components.Translator.getLocalizedMessage;
import static javax.security.auth.callback.ConfirmationCallback.OK;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController implements IAuthController {
  AuthService authService;
  UserMapper userMapper;
  UserService userService;

  @Override
  public ResponseEntity<UserInfo> getCurrentUser() {
    User user = userService.getCurrentUserInfo();
    return ResponseEntity.status(HttpStatus.OK).body(userMapper.toUserInfo(user));
  }

  @Override
  public String hello() {
    return "Hello";
  }

  @Override
  public ResponseEntity<SignUpResponse> signUp(SignUpRequest signUpRequest) {
    User user = userMapper.toUser(signUpRequest);
    authService.signUp(user, signUpRequest.passwordConfirmation(), signUpRequest.firstName(), signUpRequest.lastName());

    return ResponseEntity.status(HttpStatus.CREATED).body(new SignUpResponse("Sign up successful"));
  }

  @Override
  public ResponseEntity<SignInResponse> signIn(SignInRequest signInRequest) {
    User signInUser = authService.signIn(signInRequest.email(), signInRequest.password());

    String accessToken = authService.generateToken(signInUser, false);

    String refreshToken = authService.generateToken(signInUser, true);

    return ResponseEntity.status(HttpStatus.OK).body(
        SignInResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .build());
  }

  @Override
  public void signOut(SignOutRequest signOutRequest) {
    try {
      authService.signOut(signOutRequest.accessToken(), signOutRequest.refreshToken());
    } catch (ParseException | JOSEException e) {
      throw new AppException(INVALID_SIGNATURE, UNPROCESSABLE_ENTITY, "Invalid signature");
    }
  }

  @Override
  public ResponseEntity<SendEmailVerificationResponse> sendEmailVerification(
      @Valid @RequestBody SendEmailVerificationRequest sendEmailVerificationRequest) {
    authService.sendEmailVerification(sendEmailVerificationRequest.email(), sendEmailVerificationRequest.type());

    return ResponseEntity.status(HttpStatus.OK).body(
        new SendEmailVerificationResponse(getLocalizedMessage("resend_verification_email_success")));
  }

  @Override
  public ResponseEntity<VerifyEmailResponse> verifyEmailByCode(
      @Valid @RequestBody VerifyEmailRequest verifyEmailRequest) {
    User user = userService.findByEmail(verifyEmailRequest.email());

    authService.verifyEmail(user, verifyEmailRequest.code(), null);

    return ResponseEntity.status(HttpStatus.OK).body(
        new VerifyEmailResponse(getLocalizedMessage("verify_email_success")));
  }

  @Override
  public ResponseEntity<VerifyEmailResponse> verifyEmailByToken(@RequestParam(name = "token") String token) {
    authService.verifyEmail(null, null, token);

    return ResponseEntity.status(HttpStatus.OK).body(
        new VerifyEmailResponse(getLocalizedMessage("verify_email_success")));
  }

  @Override
  public ResponseEntity<SendEmailFogotPasswordResponse> sendForgotPassword(
      @RequestBody @Valid SendForgotPasswordRequest sendForgotPasswordRequest) {
    authService.sendEmailForgotPassword(sendForgotPasswordRequest.email());

    return ResponseEntity.status(HttpStatus.OK).body(new SendEmailFogotPasswordResponse(
        getLocalizedMessage("send_forgot_password_email_success")));
  }

  @Override
  public ResponseEntity<RefreshTokenResponse> refreshToken(@RequestBody @Valid RefreshTokenRequest refreshTokenRequest,
      HttpServletRequest httpServletRequest) {

    try {
      RefreshTokenResponse refreshTokenResponse = authService.refresh(refreshTokenRequest.refreshToken(), httpServletRequest);
      return ResponseEntity.status(HttpStatus.OK).body((refreshTokenResponse));
    } catch (ParseException | JOSEException e) {
      throw new AppException(INVALID_SIGNATURE, UNPROCESSABLE_ENTITY, "Invalid signature");
    }
  }

  @Override
  public ResponseEntity<ForgotPasswordResponse> forgotPassword(
      @RequestBody @Valid ForgotPasswordRequest forgotPasswordRequest) {
    User user = userService.findByEmail(forgotPasswordRequest.email());
    String forgotPasswordToken = authService.forgotPassword(user, forgotPasswordRequest.code());

    return ResponseEntity.status(HttpStatus.OK).body(new ForgotPasswordResponse(
        getLocalizedMessage("verify_forgot_password_code_success"),
        forgotPasswordToken));
  }

  @Override
  public ResponseEntity<ResetPasswordResponse> resetPassword(
      @RequestBody @Valid ResetPasswordRequest resetPasswordRequest) {
    authService.resetPassword(resetPasswordRequest.token(), resetPasswordRequest.password(),
        resetPasswordRequest.passwordConfirmation());

    return ResponseEntity.status(HttpStatus.OK).body(
        new ResetPasswordResponse(getLocalizedMessage("reset_password_success")));
  }

  @Override
  public ResponseEntity<IntrospectResponse> introspect(@RequestBody @Valid IntrospectRequest introspectRequest)
      throws ParseException, JOSEException {
    boolean isValid = authService.introspect(introspectRequest.token());

    return ResponseEntity.status(HttpStatus.OK).body(new IntrospectResponse(isValid));
  }

}
