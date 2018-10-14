package awkwardrobots.UI;

import awkwardrobots.util.FeedbackUploader;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.upload.Upload;
import com.vaadin.flow.router.BeforeEnterEvent;
import com.vaadin.flow.router.BeforeEnterObserver;
import com.vaadin.flow.router.Route;

@Route
public class UploadView extends VerticalLayout implements BeforeEnterObserver {

    public UploadView() {
        setSizeFull();
        setDefaultHorizontalComponentAlignment(Alignment.CENTER);
        FeedbackUploader feedbackUploader = new FeedbackUploader();
        Upload upload = new Upload(feedbackUploader);
        upload.addSucceededListener(feedbackUploader);
        add(upload);
    }

    @Override
    public void beforeEnter(BeforeEnterEvent beforeEnterEvent) {
    }
}
