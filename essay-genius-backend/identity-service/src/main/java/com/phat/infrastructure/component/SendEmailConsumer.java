package com.phat.infrastructure.component;

import com.phat.api.model.request.SendMailDto;
import com.phat.app.exception.AppException;
import com.phat.app.service.MailService;
import com.phat.domain.enums.VerificationType;
import jakarta.mail.MessagingException;
import org.springframework.messaging.handler.annotation.Header;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.kafka.annotation.DltHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.util.Locale;

import static com.phat.app.exception.AppErrorCode.SEND_MAIL_ERROR;
import static com.phat.app.helper.Constants.KAFKA_TOPIC_SEND_MAIL;
import static com.phat.app.helper.Constants.MICROSERVICE_NAME;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;
import static org.springframework.kafka.support.KafkaHeaders.RECEIVED_TOPIC;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SendEmailConsumer {

    MailService mailService;

    @KafkaListener(topics = KAFKA_TOPIC_SEND_MAIL, groupId = "${spring.kafka.identity-consumer.group-id}")
    public void listenNotificationDelivery(String message) {

        log.info("[{}]: Message received: {}", MICROSERVICE_NAME, message);
        String type = message.split(":")[0];
        String email = message.split(":")[1];
        String token = message.split(":")[2];
        String code = message.split(":")[3];
        String languageCode = message.split(":")[4];

        LocaleContextHolder.setLocale(Locale.forLanguageTag(languageCode));
        log.info("[{}]: Message received: {}", MICROSERVICE_NAME, message);

        try {
            switch (VerificationType.valueOf(type)) {
                case VERIFY_EMAIL_BY_CODE -> mailService.sendMailToVerifyWithCode(email, code);

                case VERIFY_EMAIL_BY_TOKEN -> mailService.sendMailToVerifyWithToken(email, token);

                case RESET_PASSWORD -> mailService.sendMailToResetPassword(email, code);

                case VERIFY_EMAIL_WITH_BOTH -> mailService.sendMailToVerifyWithBoth(email, token, code);
            }
        }
        catch (MessagingException | UnsupportedEncodingException e) {
            throw new AppException(SEND_MAIL_ERROR, UNPROCESSABLE_ENTITY, "Failed to create MimeMessageHelper");
        }
    }

    @DltHandler
    public void dtl(String message, @Header(RECEIVED_TOPIC) String topic) {
        log.info("[{}]: DTL TOPIC message : {}, topic name : {}", MICROSERVICE_NAME, message, topic);
    }

}
