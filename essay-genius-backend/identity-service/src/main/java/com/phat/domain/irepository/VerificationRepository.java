package com.phat.domain.irepository;

import com.phat.domain.enums.VerificationType;
import com.phat.domain.model.User;
import com.phat.domain.model.Verification;
import io.micrometer.observation.annotation.Observed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Observed
public interface VerificationRepository extends JpaRepository<Verification, String> {
    Optional<Verification> findByCode(String code);

    List<Verification> findByUserAndVerificationType(User user, VerificationType type);
}
