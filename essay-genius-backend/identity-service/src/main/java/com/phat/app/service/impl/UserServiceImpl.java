package com.phat.app.service.impl;

import com.phat.api.mapper.UserMapper;
import com.phat.api.model.request.UpdateUserRequest;
import com.phat.app.exception.AppException;
import com.phat.app.service.MinioClientService;
import com.phat.app.service.UserService;
import com.phat.common.response.UserInfo;
import com.phat.domain.model.User;
import com.phat.domain.irepository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import static com.phat.app.exception.AppErrorCode.USER_NOT_FOUND;
import static com.phat.app.helper.Utils.getCurrentUser;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserServiceImpl implements UserService {
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    UserMapper userMapper;
    MinioClientService minioClientService;

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(USER_NOT_FOUND, NOT_FOUND, "User not found with email: " + email));
    }

    @Override
    public User findById(String id) {
        return userRepository.findById(id).orElseThrow(() -> new AppException(USER_NOT_FOUND, NOT_FOUND, "User not found with id: " + id));
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public void updatePassword(User user, String password) {
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
    }

    @Override
    public void activateUser(User user) {
        user.setEnabled(true);
        userRepository.save(user);
    }

    @Override
    public User getCurrentUserInfo() {
        String id = getCurrentUser();
        User user = findById(id);
        try {
            String url = minioClientService.getObjectUrl(user.getAvatar(), "user-avatars");
            user.setAvatar(url);
            log.debug("Avatar URL retrieved: {}", url);
        } catch (Exception e) {
            log.error("Error when retrieving avatar URL for user: {}", user.getEmail(), e);
        }
        return user;
    }
    @Override
    public UserInfo updateUser(String userId, UpdateUserRequest request) {
        log.debug("Updating user with userId: {}", userId);
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        log.debug("User found: {}", user);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setBio(request.getBio());
        User updatedUser = userRepository.save(user);
        log.info("User with userId: {} updated successfully", updatedUser.getId());
        return userMapper.toUserInfo(updatedUser);
    }

    @Override
    public UserInfo updateAvatar(String userId, String avatarUrl) {
        log.debug("Updating user with userId: {}", userId);
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        log.debug("User found: {}", user);
        user.setAvatar(avatarUrl);
        User updatedUser = userRepository.save(user);
        log.info("User with userId: {} updated successfully", updatedUser.getId());
        return userMapper.toUserInfo(updatedUser);
    }
}