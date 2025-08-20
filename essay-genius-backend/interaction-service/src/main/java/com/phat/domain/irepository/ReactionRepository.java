package com.phat.domain.irepository;

import com.phat.domain.model.Reaction;
import com.phat.domain.model.ReactionType;
import com.phat.domain.model.TargetType;
import io.micrometer.observation.annotation.Observed;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Observed
public interface ReactionRepository extends MongoRepository<Reaction, String> {
    List<Reaction> findByTargetId(String essayId, String commentId);

    List<Reaction> findByTargetIdAndTargetType(String targetId, TargetType targetType);

    int countByTargetId(String targetId);

    int countByTargetIdAndReactionType(String targetId, ReactionType reactionType);

    Optional<Reaction> findByTargetIdAndCreatedBy(String targetId, String createdBy);
    Optional<Reaction> findByIdAndCreatedBy(String id, String createdBy);

}
