package awkwardrobots.util;

import awkwardrobots.Main;
import awkwardrobots.data.Comment;
import com.vaadin.ui.UI;
import com.vaadin.ui.Upload;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.util.List;

public class FeedbackUploader implements Upload.Receiver, Upload.SucceededListener {

    private String mimeType;
    private ByteArrayOutputStream outputStream;

    @Override
    public OutputStream receiveUpload(String filename, String mimeType) {
        this.mimeType = mimeType;
        return outputStream = new ByteArrayOutputStream();
    }

    @Override
    public void uploadSucceeded(Upload.SucceededEvent event) {
        CommentParser commentParser = findMatchingParser();
        List<Comment> comments = commentParser.parse(new ByteArrayInputStream(outputStream.toByteArray()));
        ((Main) UI.getCurrent()).getDashboardView().setComments(comments);
        UI.getCurrent().getNavigator().navigateTo("Dashboard");
    }

    private CommentParser findMatchingParser() {
        CommentParser commentParser = null;
        switch (mimeType) {
            case "application/pdf":
                commentParser = new EvaluationPDFParser();
                break;
            case "text/plain":
                commentParser = new TXTCommentParser();
                break;
        }
        return commentParser;
    }
}
