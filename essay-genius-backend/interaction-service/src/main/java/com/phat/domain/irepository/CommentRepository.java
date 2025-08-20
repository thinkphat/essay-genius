package com.phat.domain.irepository;

import com.phat.domain.model.Comment;
import io.micrometer.observation.annotation.Observed;
import org.springframework.data.domain.Page;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable; // ✅ Phải dùng cái này
import java.util.List;

@Repository
@Observed
public interface CommentRepository extends MongoRepository<Comment, String> {
    Page<Comment> findByEssayIdAndParentId(String essayId, String parentId, Pageable pageable);
    Page<Comment> findByEssayId(String essayId, Pageable pageable);
    Page<Comment> findByEssayIdAndParentIdIsNull(String essayId, Pageable pageable);

    long countByEssayIdAndParentId(String essayId, String parentId);
    long countByEssayId(String essayId);
    long countByParentId(String parentId);

}
