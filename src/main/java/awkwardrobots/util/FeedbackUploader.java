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

    private ByteArrayOutputStream outputStream;

    @Override
    public OutputStream receiveUpload(String filename, String mimeType) {
        return outputStream = new ByteArrayOutputStream();
    }

    @Override
    public void uploadSucceeded(Upload.SucceededEvent event) {
        CommentParser commentParser = new TXTCommentParser();
        List<Comment> comments = commentParser.parse(new ByteArrayInputStream(outputStream.toByteArray()));
        ((Main) UI.getCurrent()).getDashboardView().setComments(comments);
        UI.getCurrent().getNavigator().navigateTo("Dashboard");
    }
}
