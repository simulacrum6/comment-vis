package awkwardrobots.UI;

import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener;
import com.vaadin.ui.Button;
import com.vaadin.ui.VerticalLayout;

public class UploadView extends VerticalLayout implements View {

    public UploadView() {
        addComponent(new Button("Go to Dashboard",
                click -> getUI().getNavigator().navigateTo("Dashboard")));
    }

    @Override
    public void enter(ViewChangeListener.ViewChangeEvent event) {
    }
}
