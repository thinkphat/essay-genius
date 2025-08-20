package com.phat.app.service.impl;

import java.text.ParseException;
import java.util.List;
import java.util.stream.Collectors;

import com.google.protobuf.Empty;
import com.nimbusds.jose.JOSEException;
import com.phat.api.mapper.UserMapper;
import com.phat.app.service.AuthService;
import com.phat.app.service.MinioClientService;
import com.phat.app.service.UserService;
import com.phat.common.response.UserInfo;
import com.phat.domain.irepository.UserRepository;
import com.phat.domain.model.User;
import com.phat.grpc.essay.GetEssayIdsResponse;
import com.phat.grpc.identity.*;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import static com.phat.app.helper.Constants.MICROSERVICE_NAME;

@GrpcService
@RequiredArgsConstructor
@Slf4j
public class IdentityServiceGrpcServer extends IdentityServiceGrpc.IdentityServiceImplBase {

    private final AuthService authService;
    private final UserService userService;
    private final MinioClientService minioClientService;
    private final UserRepository userRepository;

    @Override
    public void introspect(IntrospectRequest request,
                           StreamObserver<IntrospectResponse> responseObserver) {
        String token = request.getToken();

        IntrospectResponse.Builder responseBuilder = IntrospectResponse.newBuilder();

        try {
            boolean isValid = authService.introspect(token);

            responseBuilder.setValid(isValid);
            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();

        } catch (JOSEException | ParseException e) {
            responseObserver.onError(io.grpc.Status.INTERNAL
                    .withDescription(String.format("[%s]: Token parsing or validation error: %s", MICROSERVICE_NAME, e.getMessage()))
                    .asRuntimeException());
        }
    }

    @Override
    public void getUserInfo(GetUserInfoRequest request,
                            StreamObserver<GetUserInfoResponse> responseObserver) {

        try {
            User user = userService.findById(request.getUserId());
            GetUserInfoResponse.Builder responseBuilder = GetUserInfoResponse.newBuilder()
                    .setUserId(user.getId())
                    .setEmail(user.getEmail() != null ? user.getEmail() : "")
                    .setFirstName(user.getFirstName() != null ? user.getFirstName() : "")
                    .setLastName(user.getLastName() != null ? user.getLastName() : "")
                    .setBio(user.getBio() != null ? user.getBio() : "");

            String url = minioClientService.getObjectUrl("default-avatar-url.png", "user-avatars");
            try {
                url = minioClientService.getObjectUrl(user.getAvatar(), "user-avatars");
                log.debug("Avatar URL retrieved: {}", url);
            } catch (Exception e) {
                log.error("Error when retrieving avatar URL for user: {}", user.getEmail(), e);
            }
            responseBuilder.setAvatar(url);
            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();

        } catch (Exception e) {
            responseObserver.onError(io.grpc.Status.INTERNAL
                    .withDescription(String.format("[%s]: Get user information error: %s", MICROSERVICE_NAME, e.getMessage()))
                    .asRuntimeException());
            return;
        }
    }

    @Override
    public void getUserIds(Empty request, StreamObserver<GetUserIdsResponse> responseObserver) {
        List<String> userIds = userRepository.findAll()
                .stream()
                .map(User::getId)
                .collect(Collectors.toList());

        GetUserIdsResponse response = GetUserIdsResponse.newBuilder()
                .addAllUserIds(userIds)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
