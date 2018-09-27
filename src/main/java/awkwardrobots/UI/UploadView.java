package awkwardrobots.UI;

import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener;
import com.vaadin.ui.Alignment;
import com.vaadin.ui.Label;
import com.vaadin.ui.Upload;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;

public class UploadView extends VerticalLayout implements View {

    public UploadView() {
        setWidth("500px");

        Label label = new Label("Upload your feedback data to visualize it.");
        label.addStyleNames(ValoTheme.LABEL_BOLD, ValoTheme.LABEL_HUGE, ValoTheme.LABEL_COLORED);
        label.setSizeFull();
        addComponent(label);

        Label fileFormatInfo = new Label("Iusto rerum quisquam repellendus et. Nihil corporis veniam quos distinctio officiis. Rem id consequatur tempora rem. Expedita voluptates consequuntur culpa dolorem reprehenderit.");
        addComponent(fileFormatInfo);
        fileFormatInfo.setSizeFull();

        Upload.Receiver receiver = (Upload.Receiver) (filename, mimeType) -> null;
        Upload upload = new Upload(null, receiver);
        upload.setButtonCaption("Choose file...");
        upload.addStyleName(ValoTheme.BUTTON_PRIMARY);
        addComponent(upload);
        setComponentAlignment(upload, Alignment.MIDDLE_CENTER);
    }

    @Override
    public void enter(ViewChangeListener.ViewChangeEvent event) {
    }
}
