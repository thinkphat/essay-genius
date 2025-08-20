package com.phat.domain.irepository;

import com.phat.domain.model.EssaySubmission;
import io.micrometer.observation.annotation.Observed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;


@Repository
@Observed
public interface EssaySubmissionRepository extends MongoRepository<EssaySubmission, String> {
    Page<EssaySubmission> findAllByIsDeletedAndCreatedBy(boolean isDeleted, String createdBy, Pageable pageable);

}
