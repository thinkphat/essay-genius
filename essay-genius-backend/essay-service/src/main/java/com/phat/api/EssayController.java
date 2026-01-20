package com.phat.api;

import com.phat.api.model.request.TopicsRequest;
import com.phat.api.model.response.EssayScoredResponse;
import org.springframework.web.bind.annotation.ModelAttribute;
import com.phat.api.model.request.EssaySaveRequest;
import com.phat.api.model.request.EssayTaskTwoScoringRequest;
import com.phat.api.model.request.ListEssayRequest;
import com.phat.api.model.response.CommonResponse;
import com.phat.api.model.response.EssayResponseWrapper;
import com.phat.api.model.response.EssaySaveResponse;
import com.phat.app.service.EssaySubmissionService;
import com.phat.app.service.impl.AIGrpcClient;
import com.phat.domain.enums.Visibility;
import com.phat.domain.model.EssaySubmission;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class EssayController {
    private final AIGrpcClient aiEssayGrpcClient;
    private final EssaySubmissionService essaySubmissionService;

    @GetMapping("hello")
    public String hello() {
        return "Hello";
    }

    @PostMapping("/scoring-essay")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<EssayResponseWrapper<?>> scoring(
            @Valid @RequestBody EssayTaskTwoScoringRequest essayScoringRequest) throws Exception {
        return ResponseEntity.ok()
                .body(aiEssayGrpcClient.getScores(essayScoringRequest.essayPrompt(), essayScoringRequest.essayText()));
    }

    @PostMapping("/generate-essay-prompt")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<EssayResponseWrapper<String>> generateEssayPrompt(@RequestBody TopicsRequest request)
            throws Exception {
        return ResponseEntity.ok()
                .body(aiEssayGrpcClient.generateEssayPrompt(request.topics()));
    }

    @PostMapping("/save-essay")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<CommonResponse> saveEssay(@Valid @RequestBody EssaySaveRequest essaySaveRequest)
            throws Exception {
        essaySubmissionService.saveEssay(essaySaveRequest.getEssayText(),
                essaySaveRequest.getPromptText(),
                essaySaveRequest.getEssayTaskTwoScoreResponse(),
                Visibility.fromValue(essaySaveRequest.getVisibility().toLowerCase()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonResponse.builder()
                        .message("Essay saved successfully")
                        .build());
    }

    @DeleteMapping("/delete-essay/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<CommonResponse> deleteEssay(@PathVariable String id) throws Exception {
        essaySubmissionService.deleteEssay(id);
        return ResponseEntity.ok()
                .body(CommonResponse.builder()
                        .message("Essay deleted successfully")
                        .build());
    }

    @GetMapping("/get-essay/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<EssaySaveResponse> getEssay(@PathVariable String id) throws Exception {
        EssaySubmission essay = essaySubmissionService.findEssayById(id);

        return ResponseEntity.ok()
                .body(EssaySaveResponse.builder()
                        .essayText(essay.getEssayText())
                        .promptText(essay.getPromptText())
                        .visibility(essay.getVisibility().getValue())
                        .band(essay.getBand())
                        .essayTaskTwoScoreResponse(essay.getEssayTaskTwoScoreResponse())
                        .build());
    }

    @GetMapping("")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Page<EssayScoredResponse>> getEssays(@ModelAttribute ListEssayRequest listEssayRequest)
            throws Exception {
        return ResponseEntity.ok(
                essaySubmissionService.findAllEssays(listEssayRequest));
    }

}
