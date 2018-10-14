package awkwardrobots.util;

import awkwardrobots.UI.DashboardView;
import awkwardrobots.data.CommentList;
import com.vaadin.flow.component.ComponentEventListener;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.upload.Receiver;
import com.vaadin.flow.component.upload.SucceededEvent;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;

public class FeedbackUploader implements Receiver, ComponentEventListener<SucceededEvent> {
    private String mimeType;
    private ByteArrayOutputStream outputStream;

    @Override
    public OutputStream receiveUpload(String fileName, String mimeType) {
        this.mimeType = mimeType;
        return outputStream = new ByteArrayOutputStream();
    }

    @Override
    public void onComponentEvent(SucceededEvent succeededEvent) {
        try {
            CommentParser commentParser = findMatchingParser();
            CommentList comments = commentParser.parse(new ByteArrayInputStream(outputStream.toByteArray()));
            UI.getCurrent().getSession().setAttribute(CommentList.class, comments);
            UI.getCurrent().navigate(DashboardView.class);
        } catch (IOException e) {
            Notification.show("Could not upload file. Please try again and pray it works!");
        } catch (Exception e) {
            Notification.show("Error while parsing file. Please check the format of your file.");
        }
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
